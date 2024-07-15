import { Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { MdCreditCard, MdDelete, MdGetApp, MdRefresh } from "react-icons/md";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { IconButton, Modal, Panel, ThemeToggle, notifyError, LogoutModal, createDefaultMeter, UserProfile } from "@vcassist/ui"
import ProfileHeader from "./ProfileHeader";
import { SettingsPanel } from "./Settings"

const meter = createDefaultMeter("routes.profile");
const requestData = meter.createCounter("request-data");
const deleteData = meter.createCounter("delete-data");
const viewPage = meter.createCounter("view");

const isRefreshing = signal(false);

export default function Profile(props: {
  profile: UserProfile
}) {
  useSignals();

  const [
    credentialsOpened,
    { open: openCredentials, close: closeCredentials },
  ] = useDisclosure(false);

  useEffect(() => {
    viewPage.add(1);
  }, []);

  return (
    <>
      <Modal
        opened={credentialsOpened}
        onClose={() => {
          closeCredentials();
        }}
      >
        <CredentialCarousel
          user={props.profile}
          drivers={props.drivers}
          validate={(input) => {
            return (
              props.monolithClient.validateAndUpdate.mutate(input) ??
              Promise.resolve(false)
            );
          }}
        />
      </Modal>

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
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-3 items-end">
            <div className="flex gap-3">
              <IconButton
                icon={MdGetApp}
                label="Request Data"
                color="blue"
                onClick={() => {
                  requestData.add(1);

                  window.open(
                    "https://vi.vcassist.org/data-management/requestData",
                    "_blank",
                  );
                }}
              />
              <IconButton
                icon={MdDelete}
                label="Delete Data"
                color="red"
                onClick={() => {
                  deleteData.add(1);

                  window.open(
                    "https://vi.vcassist.org/data-management/deleteData",
                    "_blank",
                  );
                }}
              />
            </div>

            <div className="flex gap-3">
              <IconButton
                icon={MdRefresh}
                label="Refresh Data"
                color="orange"
                disabled={isRefreshing.value}
                onClick={async () => {
                  isRefreshing.value = true;
                  notifications.show({
                    id: "refresh-user-data",
                    message: "Refreshing user data.",
                  });
                  try {
                    await props.monolithClient.scrape.mutate();
                    await props.refetch();
                    notifications.show({
                      message: "Refreshed successfully.",
                      autoClose: 3000,
                    });
                  } catch (err) {
                    notifyError(err);
                  }
                  notifications.hide("refresh-user-data");
                  isRefreshing.value = false;
                }}
              />

              <IconButton
                icon={MdCreditCard}
                label="Edit Credentials"
                color="gray"
                onClick={() => {
                  openCredentials();
                }}
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-end">
              <LogoutModal
                handleLogout={() => {
                  props.authIntegration.logout().catch(notifyError);
                }}
              />
            </div>
          </div>
        </Panel>
      </div>
      {/* <Connections
          className="min-h-[300px] h-full lg:col-span-3 xl:col-span-2"
          connections={[]}
        /> */}
      <SettingsPanel className="min-h-[300px] h-full lg:col-span-3 xl:col-span-2" />
    </>
  );
}
