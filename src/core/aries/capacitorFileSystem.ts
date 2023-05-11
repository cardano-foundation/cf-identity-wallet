import type { FileSystem, DownloadToFileOptions } from "@aries-framework/core";
import { getDirFromFilePath, AriesFrameworkError } from "@aries-framework/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

class CapacitorFileSystem implements FileSystem {
    public readonly dataPath;
    public readonly cachePath;
    public readonly tempPath;

    public constructor(options?: {
        baseDataPath?: string;
        baseCachePath?: string;
        baseTempPath?: string;
    }) {
        this.dataPath = Directory.Data;
        this.cachePath = Directory.Cache;
        this.tempPath = Directory.Cache;

        this.dataPath = `${options?.baseDataPath ?? Directory.Data}/.afj`;
        this.cachePath = options?.baseCachePath
            ? `${options?.baseCachePath}/.afj`
            : `${Directory.Cache}/.afj${Capacitor.getPlatform() === "android" ? "/cache" : ""
            }`;
        this.tempPath = options?.baseTempPath
            ? `${options?.baseTempPath}/.afj`
            : `${Directory.Cache}/.afj${Capacitor.getPlatform() === "android" ? "/temp" : ""
            }`;
    }

    public async exists(path: string): Promise<boolean> {
        try {
            await Filesystem.stat({ path, directory: Directory.Data });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async createDirectory(path: string): Promise<void> {
        if (!await this.exists(path)) {
            await Filesystem.mkdir({ path: path, directory: Directory.Data, recursive: true });
        }
    }

    public async copyFile(
        sourcePath: string,
        destinationPath: string
    ): Promise<void> {
        await this.createDirectory(getDirFromFilePath(destinationPath));
        await Filesystem.copy({ from: sourcePath, to: destinationPath, directory: Directory.Data, toDirectory: Directory.Data });
    }

    public async write(path: string, data: string): Promise<void> {
        await this.createDirectory(getDirFromFilePath(path));
        await Filesystem.writeFile({
            path: path,
            data: data,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
    }

    public async read(path: string): Promise<string> {
        return (await Filesystem.readFile({ path: path, directory: Directory.Data, encoding: Encoding.UTF8 }))
            .data;
    }

    public async delete(path: string): Promise<void> {
        try {
            await Filesystem.rmdir({ path: path, directory: Directory.Data, recursive: true });
        } catch (e: any) {
            await Filesystem.deleteFile({ path: path, directory: Directory.Data });
        }
    }

    public async downloadToFile(
        url: string,
        path: string,
        options?: DownloadToFileOptions
    ) {
        throw new AriesFrameworkError("downloadToFile not implemented yet");

        /*
        // Make sure parent directories exist
        await this.createDirectory(getDirFromFilePath(path));

        try {
            const file_request = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                mode: 'no-cors'
            });
            const file_blob = await file_request.blob();

            const reader = new FileReader();
            reader.readAsDataURL(file_blob);
            reader.onloadend = async () => {
                try {
                    try {
                        if (typeof reader.result === 'string') {
                            await this.write(path, reader.result);
                        } else {
                            console.error('Unexpected type for reader.result');
                        }
                    } catch (err) {
                        console.error(err);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err);
        }*/

    }
}

export { CapacitorFileSystem };