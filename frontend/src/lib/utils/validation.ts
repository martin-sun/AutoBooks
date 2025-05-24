/**
 * 验证工具函数
 */

/**
 * 检查字符串是否是有效的UUID格式
 * @param uuid 要验证的字符串
 * @returns 如果是有效的UUID格式则返回true，否则返回false
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * 获取默认工作空间ID（用于无效UUID的情况）
 * 这是一个占位符函数，实际实现应该从用户的默认工作空间中获取
 * @returns 默认工作空间ID或null
 */
export const getDefaultWorkspaceId = async (): Promise<string | null> => {
  // 实际实现应该从用户的默认工作空间中获取
  // 这里只是一个占位符
  return null;
};
