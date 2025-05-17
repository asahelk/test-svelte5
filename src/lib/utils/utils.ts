export function mergeArrayObjectsByKeyWithMap<T>(arr: T[], key: keyof T) {
    const map = new Map();
    const repeatedKeys = [];
    for (const obj of arr) {
        const keyValue = obj[key];
        if (map.has(keyValue)) {
            // Merge new item into existing item
            // Properties from later objects in the array will overwrite earlier ones
            repeatedKeys.push(keyValue);
            map.set(keyValue, { ...map.get(keyValue), ...obj });
        } else {
            // Add new item (create a shallow copy)
            map.set(keyValue, { ...obj });
        }
    };

    return { array: Array.from(map.values()), repeatedKeys };
}