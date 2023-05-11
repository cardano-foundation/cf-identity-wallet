import type { FileSystem, DownloadToFileOptions } from "@aries-framework/core";
import { getDirFromFilePath, AriesFrameworkError } from "@aries-framework/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

class CapacitorFileSystem implements FileSystem {
    private static readonly dataBasePath = Directory.Data;
    
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

        this.dataPath = `${CapacitorFileSystem.dataBasePath}/.afj}`;
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
            await Filesystem.stat({ path, directory: CapacitorFileSystem.dataBasePath });
            return true;
        } catch (e) {
            return false;
        }
    }

    public async createDirectory(path: string): Promise<void> {
        if (!await this.exists(path)) {
            await Filesystem.mkdir({ path: path, directory: CapacitorFileSystem.dataBasePath, recursive: true });
        }
    }

    public async copyFile(
        sourcePath: string,
        destinationPath: string
    ): Promise<void> {
        if ((await Filesystem.stat({ path: sourcePath, directory: CapacitorFileSystem.dataBasePath })).type === 'file') {
            await this.createDirectory(getDirFromFilePath(destinationPath));
            await Filesystem.copy({ from: sourcePath, to: destinationPath, directory: CapacitorFileSystem.dataBasePath, toDirectory: CapacitorFileSystem.dataBasePath });
        } else {
            throw new Error('It is not possible to copy folders');
        }
    }

    public async write(path: string, data: string): Promise<void> {
        await this.createDirectory(getDirFromFilePath(path));
        await Filesystem.writeFile({
            path: path,
            data: data,
            directory: CapacitorFileSystem.dataBasePath,
            encoding: Encoding.UTF8,
        });
    }

    public async read(path: string): Promise<string> {
        return (await Filesystem.readFile({ path: path, directory: CapacitorFileSystem.dataBasePath, encoding: Encoding.UTF8 }))
            .data;
    }

    public async delete(path: string): Promise<void> {
        try {
            await Filesystem.rmdir({ path: path, directory: CapacitorFileSystem.dataBasePath, recursive: true });
        } catch (e: any) {
            await Filesystem.deleteFile({ path: path, directory: CapacitorFileSystem.dataBasePath });
        }
    }

    public async downloadToFile(
        url: string,
        path: string,
        options?: DownloadToFileOptions
    ) {
        throw new AriesFrameworkError("downloadToFile not implemented yet");
    }
}

export { CapacitorFileSystem };