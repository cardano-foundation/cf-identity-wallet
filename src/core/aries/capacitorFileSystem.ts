import type { FileSystem, DownloadToFileOptions } from "@aries-framework/core";
import { getDirFromFilePath } from "@aries-framework/core";
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
      : `${Directory.Cache}/.afj${
          Capacitor.getPlatform() === "android" ? "/cache" : ""
        }`;
    this.tempPath = options?.baseTempPath
      ? `${options?.baseTempPath}/.afj`
      : `${Directory.Cache}/.afj${
          Capacitor.getPlatform() === "android" ? "/temp" : ""
        }`;
  }

  public async exists(path: string): Promise<boolean> {
    try {
        await Filesystem.stat({path, directory: Directory.Documents});
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
  }

  public async createDirectory(path: string): Promise<void> {
    if (!await this.exists(path)) {
        await Filesystem.mkdir({ path: path, directory: Directory.Documents, recursive: true });
    }
  }

  public async copyFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    await Filesystem.copy({ from: sourcePath, to: destinationPath, directory: Directory.Documents, toDirectory: Directory.Documents });
  }

  public async write(path: string, data: string): Promise<void> {
    await this.createDirectory(getDirFromFilePath(path));
    await Filesystem.writeFile({
      path: path,
      data: data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  }

  public async read(path: string): Promise<string> {
    return (await Filesystem.readFile({ path: path, directory: Directory.Documents, encoding: Encoding.UTF8 }))
      .data;
  }

  public async delete(path: string): Promise<void> {
    await Filesystem.deleteFile({ path: path, directory: Directory.Documents });
    try {
        await Filesystem.rmdir({ path: path, directory: Directory.Documents, recursive: true });
    } catch(e: any) {
        if (e.message === "Requested path is not a directory") {
            await Filesystem.deleteFile({ path: path, directory: Directory.Documents });
        }
    }
  }

  public async downloadToFile(
    url: string,
    path: string,
    options?: DownloadToFileOptions
  ) {
    /*const httpMethod = url.startsWith('https') ? https : http

    // Make sure parent directories exist
    await this.createDirectory(getDirFromFilePath(path));

    const file = fs.createWriteStream(path)
    const hash = options.verifyHash ? createHash('sha256') : undefined

    return new Promise<void>((resolve, reject) => {
      httpMethod
        .get(url, (response) => {
          // check if response is success
          if (response.statusCode !== 200) {
            reject(`Unable to download file from url: ${url}. Response status was ${response.statusCode}`)
          }

          hash && response.pipe(hash)
          response.pipe(file)
          file.on('finish', async () => {
            file.close()

            if (hash && options.verifyHash?.hash) {
              hash.end()
              const digest = hash.digest()
              if (digest.compare(options.verifyHash.hash) !== 0) {
                await fs.promises.unlink(path)

                reject(
                  new AriesFrameworkError(
                    `Hash of downloaded file does not match expected hash. Expected: ${
                      options.verifyHash.hash
                    }, Actual: ${TypedArrayEncoder.toUtf8String(digest)})}`
                  )
                )
              }
            }
            resolve()
          })
        })
        .on('error', async (error) => {
          // Handle errors
          await unlink(path) // Delete the file async. (But we don't check the result)
          reject(`Unable to download file from url: ${url}. ${error.message}`)
        })
    })
  }*/
  }
}

export { CapacitorFileSystem };