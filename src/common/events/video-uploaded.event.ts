export class VideoUploadedEvent {
  public readonly videoId: string;
  public readonly creatorId: string;
  public readonly originalFileName: string;
  public readonly videoUrl: string;

  constructor(
    videoId: string,
    creatorId: string,
    originalFileName: string,
    videoUrl: string,
  ) {
    this.videoId = videoId;
    this.creatorId = creatorId;
    this.originalFileName = originalFileName;
    this.videoUrl = videoUrl;
  }
}
