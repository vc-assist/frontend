import "@mantine/carousel/styles.css";

import { Carousel, type Embla } from "@mantine/carousel";
import { Avatar, Button, Title, rem } from "@mantine/core";
import { useEffect, useState } from "react";
import { MdArrowBack, MdArrowForward, MdEdit } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { OAuthForm, UsernamePasswordForm } from "./forms";
import { useStringToMantineColor, UserAvatar, Panel, BrandTag, useImageToColor, ErrorPage } from "@vcassist/ui"
import { GetCredentialStatusRequest, type CredentialStatus } from "@backend.studentdata/api_pb"
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../providers"

function CredentialForm(props: {
  className?: string;
  status: CredentialStatus
  onSubmit(): void
}) {
  const { profile } = useUser()

  const pictureColor = useImageToColor(props.status.picture ?? "");
  const fallbackColor = useStringToMantineColor(props.status.name);
  const [editing, setEditing] = useState(!props.status.provided);

  const color = pictureColor ?? fallbackColor;

  let form = <></>;
  switch (props.status.loginFlow.case) {
    case "usernamePassword":
      form = (
        <UsernamePasswordForm
          color={color}
          credentialId={props.status.id}
          loginFlow={props.status.loginFlow}
          onSubmit={props.onSubmit}
        />
      );
      break;
    case "oauth":
      form = (
        <OAuthForm
          color={color}
          credentialId={props.status.id}
          loginFlow={props.status.loginFlow}
          onSubmit={props.onSubmit}
        />
      );
      break;
  }

  return (
    <Panel className={twMerge("flex flex-col gap-4 max-w-xs", props.className)}>
      <Avatar.Group>
        <UserAvatar className="rounded-full w-14 h-14" {...profile} />
        <Avatar
          classNames={{
            root: "rounded-full w-14 h-14",
            placeholder: "text-xl",
          }}
          c={color}
          variant="filled"
          src={profile.picture}
        >
          {props.status.name[0].toUpperCase()}
        </Avatar>
      </Avatar.Group>

      <div className="flex flex-col gap-2">
        <Title order={3}>
          {editing ? "Enter your credentials" : "Credentials provided"}
        </Title>
        <p>
          {editing ? (
            <>
              By providing your <b>{props.status.name}</b> credentials to VC
              Assist, you&apos;re enabling VC Assist to retrieve your data.
            </>
          ) : (
            <>
              You have already provided your <b>{props.status.name}</b>{" "}
              credentials.
            </>
          )}
        </p>
      </div>

      {!editing ? (
        <div className="flex gap-3">
          {/* disabled while it doesn't work */}
          {/* <Button
            style={{ backgroundColor: driverColor }}
            c={driverColor}
            leftSection={<MdEmail size={16} />}
          >
            Request
          </Button> */}
          <Button
            variant="outline"
            c="gray"
            leftSection={<MdEdit size={16} />}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </div>
      ) : (
        form
      )}

      {props.status.provided && editing ? (
        <Button
          className="w-fit m-auto"
          variant="subtle"
          c="gray"
          onClick={() => setEditing(false)}
        >
          Stop editing
        </Button>
      ) : undefined}
    </Panel>
  );
}

export function CredentialCarousel(props: {
  className?: string
  credentials: CredentialStatus[]
}) {
  const [credentials, setCredentials] = useState(props.credentials)
  const [embla, setEmbla] = useState<Embla | null>(null);

  return (
    <>
      <Carousel
        className={props.className}
        slideSize="100%"
        w="100%"
        height="100%"
        withIndicators
        styles={{
          indicator: {
            width: rem(12),
            height: rem(4),
            transition: "width 250ms ease",
          },
        }}
        withControls
        withKeyboardEvents={false}
        controlSize={40}
        previousControlIcon={<MdArrowBack size={22} />}
        nextControlIcon={<MdArrowForward size={22} />}
        getEmblaApi={setEmbla}
      >
        {props.credentials.map((cred, i) => (
          <Carousel.Slide
            className="flex hover:cursor-grab active:cursor-grabbing"
            key={cred.name}
          >
            <CredentialForm
              status={cred}
              className="m-auto hover:cursor-auto"
              onSubmit={() => {
                credentials[i].provided = true
                setCredentials([...credentials])

                if (!embla) {
                  return
                }
                const idx = credentials.findIndex(c => !c.provided)
                if (idx >= 0) {
                  embla.scrollTo(idx)
                }
              }}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
      <BrandTag className="absolute bottom-12 left-1/2 -translate-x-1/2" />
    </>
  )
}

export function ProvideCredentialsPage(props: {
  onComplete: () => void;
}) {
  const { studentDataClient } = useUser()

  const { isPending, error, data } = useQuery({
    queryKey: ["studentDataClient", "getCredentialStatus"],
    queryFn: () => studentDataClient.getCredentialStatus(new GetCredentialStatusRequest())
      .then((res) => {
        const statuses = res.statuses
        if (!statuses) {
          throw new Error("Credential statuses are undefined.")
        }
        return statuses
      })
  })

  const completed = data?.every(c => c.provided)
  useEffect(() => {
    if (!completed) {
      return
    }
    props.onComplete()
  }, [completed, props.onComplete])


  if (isPending) {
    return
  }
  if (error) {
    return (
      <ErrorPage
        message="Failed to fetch student credential status."
        description={error.message}
      />
    )
  }

  return (
    <div className="flex w-full h-full">
      <CredentialCarousel
        className={twMerge("transition-all", completed ? "blur-sm" : "")}
        credentials={data}
      />
      {/* {completed ? ( */}
      {/*   <Positioned x="center" y="middle"> */}
      {/*     <Button */}
      {/*       className="shadow-lg bg-primary text-bg hover:text-bg hover:bg-primary" */}
      {/*       onClick={props.onComplete} */}
      {/*       variant="filled" */}
      {/*       c="dark" */}
      {/*       leftSection={<MdArrowBack size={16} />} */}
      {/*     > */}
      {/*       Dashboard */}
      {/*     </Button> */}
      {/*   </Positioned> */}
      {/* ) : undefined} */}
    </div>
  );
}

