/** @format */

import { useToken, useUser } from "@/src/stores";
import { Button, TextInput, Title } from "@mantine/core";
import {
  IconButton,
  LogoutModal,
  Panel,
  ThemeToggleButton,
  type UserProfile,
  createDefaultMeter,
  Modal,
} from "@vcassist/ui";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { MdDelete, MdGetApp, MdLink } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import ProfileHeader from "./ProfileHeader";
import { SettingsPanel } from "./Settings";
import { client } from "../Auth";

const meter = createDefaultMeter("routes.profile");
const requestData = meter.createCounter("request-data");
const deleteData = meter.createCounter("delete-data");
const viewPage = meter.createCounter("view");

export default function Profile(props: { profile: UserProfile }) {
  const token = useToken();
  const linkEmail = useMutation({
    mutationFn: (args: { parentEmail: string }) => {
      const ret = client.linkParentEmail({
        parentEmail: args.parentEmail,
        token: token.token,
      });
      return ret;
    },
  });
  const parentRef = useRef<HTMLInputElement>(null);
  const logout = useUser((user) => user.logout);
  const [parent, setParentState] = useState(false);
  useEffect(() => {
    viewPage.add(1);
  }, []);

  return (
    <div
      className={twMerge(
        "h-full grid grid-cols-1 grid-rows-[min-content_min-content_1fr]",
        "lg:grid-cols-5 xl:grid-cols-3 lg:grid-rows-[1fr_2fr] gap-6"
      )}
    >
      <ProfileHeader
        className="lg:col-span-5 xl:col-span-3"
        {...props.profile}
      />
      <div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-1">
        <Panel className="flex justify-between gap-3 h-fit">
          <div className="flex flex-col gap-3">
            <Title className="max-w-[5rem]" order={4}>
              Control Panel
            </Title>

            <ThemeToggleButton />
          </div>
          <div className="flex flex-col gap-3 items-end">
            <div className="flex gap-3">
              <IconButton
                icon={MdGetApp}
                label="Request Account Data"
                color="blue"
                onClick={() => {
                  requestData.add(1);

                  window.open(
                    "https://vi.vcassist.org/data-management/requestData",
                    "_blank"
                  );
                }}
              />
              <IconButton
                icon={MdDelete}
                label="Delete Account Data"
                color="red"
                onClick={() => {
                  deleteData.add(1);

                  window.open(
                    "https://vi.vcassist.org/data-management/deleteData",
                    "_blank"
                  );
                }}
              />
              <IconButton
                icon={MdLink}
                label="Link Parent Email"
                color="red"
                onClick={() => {
                  setParentState(true);
                }}
              />

              <Modal
                opened={parent}
                closeControls={true}
                onClose={() => setParentState(false)}
              >
                <div className="w-full h-full flex">
                  <Panel className="m-auto flex flex-col gap-3 ">
                    <TextInput
                      placeholder="Enter your parent email here"
                      ref={parentRef}
                    />
                    <Button
                      color="blue"
                      onClick={() => {
                        linkEmail.mutate({
                          parentEmail: parentRef.current?.value!,
                        });
                      }}
                    >
                      Link Parent Email
                    </Button>
                  </Panel>
                </div>
              </Modal>
            </div>

            <div className="flex gap-3">
              {/* <IconButton */}
              {/*   icon={MdRefresh} */}
              {/*   label="Refresh Data" */}
              {/*   color="orange" */}
              {/*   disabled={isRefreshing.value} */}
              {/*   onClick={async () => { */}
              {/*     isRefreshing.value = true */}
              {/*     notifications.show({ */}
              {/*       id: "refresh-user-data", */}
              {/*       message: "Refreshing user data.", */}
              {/*     }) */}
              {/*     try { */}
              {/*       await refreshStudentData() */}
              {/*       notifications.show({ */}
              {/*         message: "Refreshed successfully.", */}
              {/*         autoClose: 3000, */}
              {/*       }) */}
              {/*     } catch (err) { */}
              {/*       notifyError(err) */}
              {/*     } */}
              {/*     notifications.hide("refresh-user-data") */}
              {/*     isRefreshing.value = false */}
              {/*   }} */}
              {/* /> */}
            </div>

            <div className="flex gap-3 flex-wrap justify-end">
              <LogoutModal handleLogout={logout} />
            </div>
          </div>
        </Panel>
      </div>
      <SettingsPanel className="min-h-[300px] h-full lg:col-span-3 xl:col-span-2" />
    </div>
  );
}
