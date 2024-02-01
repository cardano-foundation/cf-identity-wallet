import type { FileSystem, DownloadToFileOptions } from "@aries-framework/core";
import { getDirFromFilePath, AriesFrameworkError } from "@aries-framework/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

class CapacitorFileSystem implements FileSystem {
  private static readonly dataBasePath = Directory.Data;

  readonly dataPath;
  readonly cachePath;
  readonly tempPath;

  constructor(options?: {
    baseDataPath?: string;
    baseCachePath?: string;
    baseTempPath?: string;
  }) {
    this.dataPath = ".afj";
    this.cachePath = options?.baseCachePath
      ? `${options?.baseCachePath}/.afj`
      : `${Directory.Cache}/.afj${
        Capacitor.getPlatform() === "android" ? "/cache" : ""
      }`;
    this.tempPath = options?.baseTempPath
      ? `${options?.baseTempPath}/.afj`
      : `${Directory.Cache}/.afj${
        Capacitor.getPlatform() === "android" ? "/temp" : ""
      }`;
  }

  async exists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path,
        directory: CapacitorFileSystem.dataBasePath,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async createDirectory(path: string): Promise<void> {
    if (!(await this.exists(path))) {
      await Filesystem.mkdir({
        path: getDirFromFilePath(path),
        directory: CapacitorFileSystem.dataBasePath,
        recursive: true,
      });
    }
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    if (
      (
        await Filesystem.stat({
          path: sourcePath,
          directory: CapacitorFileSystem.dataBasePath,
        })
      ).type === "file"
    ) {
      await this.createDirectory(getDirFromFilePath(destinationPath));
      await Filesystem.copy({
        from: sourcePath,
        to: destinationPath,
        directory: CapacitorFileSystem.dataBasePath,
        toDirectory: CapacitorFileSystem.dataBasePath,
      });
    } else {
      throw new Error("It is not possible to copy folders");
    }
  }

  async write(path: string, data: string): Promise<void> {
    await this.createDirectory(getDirFromFilePath(path));
    await Filesystem.writeFile({
      path: path,
      data: data,
      directory: CapacitorFileSystem.dataBasePath,
      encoding: Encoding.UTF8,
    });
  }

  async read(path: string): Promise<string> {
    const readFileResult = await Filesystem.readFile({
      path: path,
      directory: CapacitorFileSystem.dataBasePath,
      encoding: Encoding.UTF8,
    });

    if (typeof readFileResult.data === "string") {
      return readFileResult.data;
    } else {
      const blobData = readFileResult.data as Blob;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Error reading the Blob as a string"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blobData);
      });
    }
  }

  async delete(path: string): Promise<void> {
    // Skip anything related to backups as we don't support them yet.
    if (!path.startsWith(`${this.dataPath}/migration/backup`)) {
      try {
        await Filesystem.rmdir({
          path: path,
          directory: CapacitorFileSystem.dataBasePath,
          recursive: true,
        });
      } catch (e) {
        await Filesystem.deleteFile({
          path: path,
          directory: CapacitorFileSystem.dataBasePath,
        });
      }
    }
  }

  async downloadToFile(
    _url: string,
    _path: string,
    _options?: DownloadToFileOptions
  ) {
    throw new AriesFrameworkError("downloadToFile not implemented yet");
  }
}

export { CapacitorFileSystem };
