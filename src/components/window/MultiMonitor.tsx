import MultiMonitorToggle from "../MultiMonitorToggle";

const MultiMonitor = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-heading tracking-wide">Multi-Monitor Setup</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Choose whether the break background fills one display or all of them
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
                            <p className="font-medium text-foreground">Primary monitor</p>
                            <p>The break background and controls (timer, skip, todos) appear on your main display only. Other screens stay unchanged.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Multi-monitor (Premium)</p>
                            <p>The same background theme fills every connected display. Timer, skip, and other controls stay on your primary display—dismissing the break there closes all screens.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiMonitor;
