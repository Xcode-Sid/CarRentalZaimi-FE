import { notifications } from "@mantine/notifications";
import i18next from "i18next";

function getErrorTitle() {
  return i18next.t("common.errorTitle");
}

function getWarningTitle() {
  return i18next.t("common.warningTitle");
}

function getSuccessTitle() {
  return i18next.t("common.successTitle");
}

function getInfoTitle() {
  return i18next.t("common.infoTitle");
}

export function showApiError(message: string) {
  notifications.show({
    color: "red",
    title: getErrorTitle(),
    message,
  });
}

export function showApiWarning(message: string) {
  notifications.show({
    color: "orange",
    title: getWarningTitle(),
    message,
  });
}

export function showApiSuccess(message: string) {
  notifications.show({
    color: "teal",
    title: getSuccessTitle(),
    message,
    autoClose: 4000,
  });
}

export function showApiInfo(message: string) {
  notifications.show({
    color: "teal",
    title: getInfoTitle(),
    message,
  });
}

