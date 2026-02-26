import MultiMonitorToggle from "../MultiMonitorToggle";

const MultiMonitor = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-heading tracking-wide">Multi-Monitor Setup</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Configure how break reminders appear across your displays
                </p>
            </div>

            <MultiMonitorToggle />

            <div className="rounded-lg border border-muted p-6 space-y-4">
                <h4 className="text-lg font-semibold">How it works</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            1
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Primary Monitor Mode</p>
                            <p>Break reminders appear only on your main screen. Perfect for single monitor setups or when you want to keep secondary displays available during breaks.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Multi-Monitor Mode (Premium)</p>
                            <p>Break reminders cover all connected displays simultaneously. Ensures you take proper breaks by preventing work on any screen. Uses optimized rendering for minimal memory usage.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiMonitor;
