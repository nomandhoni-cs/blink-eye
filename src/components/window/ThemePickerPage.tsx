import { ThemePicker } from "../ThemePicker";

const ThemePickerPage = () => {
  return (
    <div className="space-y-4 p-2">
      <h3 className="text-2xl font-heading tracking-wide">Theme Picker</h3>
      <p className="text-sm text-muted-foreground">
        Choose an accent color that will be applied across the entire app.
      </p>
      <ThemePicker />
    </div>
  );
};

export default ThemePickerPage;
