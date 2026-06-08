import { useState, useEffect } from "react";

/**
 * Returns `true` if the current device is considered a mobile device.
 * Combines touch/coarse pointer detection with a configurable width breakpoint.
 *
 * @param breakpoint - maximum width (in pixels) to be considered mobile. Default 768.
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const checkMobile = () => {
            const hasTouch =
                "ontouchstart" in window ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
            const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
            const isSmallScreen = window.innerWidth < breakpoint;
            setIsMobile((hasTouch || hasCoarsePointer) && isSmallScreen);
        };

        checkMobile();

        mql.addEventListener("change", checkMobile);
        window.addEventListener("resize", checkMobile);

        return () => {
            mql.removeEventListener("change", checkMobile);
            window.removeEventListener("resize", checkMobile);
        };
    }, [breakpoint]);

    return isMobile;
}