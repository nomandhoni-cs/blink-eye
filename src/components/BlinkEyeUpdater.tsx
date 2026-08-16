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
  const { latestVersion, dialogOpen, dismissUpdate, downloadAndInstall } =
    useUpdate();

  return (
    <AlertDialog open={dialogOpen} onOpenChange={(open) => {
      if (!open) void dismissUpdate();
    }}>
      <div className="w-80">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              Blink Eye v{latestVersion} is available. Would you like to update
              now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => void dismissUpdate()}>
              Not now
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void downloadAndInstall()}>
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
