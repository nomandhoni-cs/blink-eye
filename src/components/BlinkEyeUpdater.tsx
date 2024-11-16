import { useUpdater } from "../hooks/useAutoUpdater";
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
  const { isUpdateAvailable, handleUpdate, setIsUpdateAvailable } =
    useUpdater();

  return (
    <AlertDialog open={isUpdateAvailable} onOpenChange={setIsUpdateAvailable}>
      <div className="w-80">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version of Blink Eye is available. Would you like to update
              now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsUpdateAvailable(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
