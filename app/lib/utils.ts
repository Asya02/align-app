function getTableName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric characters with underscore
  }

export { getTableName }