export const toPascalCase = (str) => {
    if (!str) return str;
    return str
        .toString()
        .toLowerCase()
        .split(/[\s_]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
