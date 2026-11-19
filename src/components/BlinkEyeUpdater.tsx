import { useTranslation } from "react-i18next";
import { useUpdate } from "../contexts/UpdateContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function UpdateDialog() {
  const { t } = useTranslation();
  const { latestVersion, dialogOpen, dismissUpdate, downloadAndInstall } =
    useUpdate();

  return (
    <AlertDialog open={dialogOpen} onOpenChange={(open) => {
      if (!open) void dismissUpdate();
    }}>
      <div className="w-80">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("update.dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("update.dialog.body", { version: latestVersion })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => void dismissUpdate()}>
              {t("update.dialog.later")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void downloadAndInstall()}>
              {t("update.dialog.update")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
