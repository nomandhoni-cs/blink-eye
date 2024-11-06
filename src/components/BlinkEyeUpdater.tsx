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
import { useUpdater } from "../hooks/useAutoUpdater";
export function UpdateDialog() {
  const { isUpdateAvailable, handleUpdate, setIsUpdateAvailable } =
    useUpdater();

  return (
    <AlertDialog open={isUpdateAvailable} onOpenChange={setIsUpdateAvailable}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Available</AlertDialogTitle>
          <AlertDialogDescription>
            A new version is available. Would you like to update now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsUpdateAvailable(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdate}>Update</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
