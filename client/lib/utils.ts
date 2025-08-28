export const getSeverityColor = (level: string) => {
    if (
        level === "critical"
    ) {
        return "bg-red-200 dark:bg-red-500/20 border-red-600 border-2";
    } else if (
        level === "high"
    ) {
        return "bg-red-100 dark:bg-red-500/15 border-red-400";
    } else if (
        level === "moderate"
    ) {
        return "bg-orange-100 dark:bg-orange-500/20 border-orange-600";
    } else if (
        level === "low"
    ) {
        return "bg-yellow-100 dark:bg-yellow-500/20 border-yellow-400";
    } else {
        return "bg-cyan-100 dark:bg-cyan-500/20 border-cyan-400";
    }
};


export const getSeverityTextColor = (level: string) => {
    if (
        level === "critical"
    ) {
        return "text-red-600 dark:text-red-400";
    } else if (
        level === "high"
    ) {
        return "text-red-500 dark:text-red-400";
    } else if (
        level === "moderate"
    ) {
        return "text-orange-600 dark:text-orange-400";
    } else if (
        level === "low"
    ) {
        return "text-yellow-400 dark:text-yellow-300";
    } else {
        return "text-cyan-400";
    }
};
