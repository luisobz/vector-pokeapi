"use client";
import { useEffect, useCallback } from "react";
import { registerReset } from "../reset";

export function useLayout() {
    const bodyScroll = useCallback((activate: boolean) => {
        document.body.style.position = activate ? "fixed" : "";
        document.body.style.inset = activate ? "0" : "";
    }, []);

    const reset = useCallback(() => {
        bodyScroll(true);
    }, [bodyScroll]);

    useEffect(() => {
        registerReset(reset);
    }, [reset]);

    return { bodyScroll, resetModule: reset };
}