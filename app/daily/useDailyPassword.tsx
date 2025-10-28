import { useCallback, useState } from "react";

const KEY = "daily-password";

export default function useDailyPassword(): [string, (newPassword: string) => void] {
    const [password, setPasswordRaw] = useState<string>(() => {
        if (global.window == undefined || localStorage == null) {
            return "";
        }
        const fromStorage = localStorage.getItem(KEY);
        return fromStorage ?? "";
    });

    const setPassword = useCallback(
        (newPassword: string) => {
            setPasswordRaw(newPassword);
            if (global.window == undefined || localStorage == null) {
                return;
            }
            localStorage.setItem(KEY, newPassword);
        },
        [],
    );

    return [password, setPassword];
}
