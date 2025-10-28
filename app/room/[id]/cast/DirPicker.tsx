import { Button } from "@mantine/core";
import { useRef } from "react";

type Props = {};

export default function DirPicker() {
    const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
    return (
        <Button
            onClick={async () => {
                const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
                const fileHandle = await dirHandle.getFileHandle(`score.txt`, { create: true });
                setInterval(async () => {
                    const writable = await fileHandle.createWritable();
                    writable.truncate(0);
                    writable.write(Date.now().toString());
                    writable.close();
                }, 1000);
            }}>
            Select directory
        </Button>
    );
}