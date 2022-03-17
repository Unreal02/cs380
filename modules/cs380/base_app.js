export class BaseApp {
    async initialize() {
        // Add initialization behavior in subclasses
    }

    finalize() {
        // Add finalization behavior in subclasses
    }

    update(elapsed, dt) {
        // Add per-frame behavior in subclasses
    }

    async run() {
        await this.initialize();

        let start;
        let prev;
        const updateCallback = (timestamp) => {
            if (this.stopped) return;
            
            timestamp /= 1000; // ms to seconds
            if (start == undefined) start = timestamp;
            if (prev == undefined) prev = start;
            const elapsed = timestamp - start;
            const dt = timestamp - prev;
            prev = timestamp;

            this.update(elapsed, dt);

            window.requestAnimationFrame(updateCallback);
        }
        window.requestAnimationFrame(updateCallback);
    }

    stop() {
        this.stopped = true;
    }
}
