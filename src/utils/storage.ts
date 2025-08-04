/**
 * 保存数据到本地存储
 * @param key 存储键名
 * @param data 要存储的数据
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data, (_, value) => {
      // 处理Date对象
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('保存到本地存储失败:', error);
    throw new Error('保存数据失败');
  }
};

/**
 * 从本地存储加载数据
 * @param key 存储键名
 * @returns 加载的数据，如果不存在则返回null
 */
export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }

    const data = JSON.parse(serializedData, (_, value) => {
      // 恢复Date对象
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });

    return data;
  } catch (error) {
    console.error('从本地存储加载失败:', error);
    // 清除损坏的数据
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * 从本地存储删除数据
 * @param key 存储键名
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('删除本地存储数据失败:', error);
  }
};

/**
 * 清空所有本地存储数据
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空本地存储失败:', error);
  }
};

/**
 * 检查本地存储是否可用
 * @returns 是否可用
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取本地存储使用情况
 * @returns 使用情况信息
 */
export const getLocalStorageUsage = (): { used: number; total: number; percentage: number } => {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // 估算总容量（通常为5-10MB）
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  } catch {
    return { used: 0, total: 0, percentage: 0 };
  }
};