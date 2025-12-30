export type Interval = {
    start: number
    end: number
}

type Node = {
    interval: Interval
    maxEnd: number
    left: Node | null
    right: Node | null
}

function overlaps(a: Interval, b: Interval) {
    // half-open intervals: [start, end)
    return a.start < b.end && b.start < a.end
}

export function insert(root: Node | null, interval: Interval): Node {
    if (!root) {
        return { interval, maxEnd: interval.end, left: null, right: null }
    }

    if (interval.start < root.interval.start) {
        root.left = insert(root.left, interval)
    } else {
        root.right = insert(root.right, interval)
    }

    root.maxEnd = Math.max(root.maxEnd, interval.end)
    return root
}

export function hasOverlap(root: Node | null, target: Interval): boolean {
    if (!root) return false

    if (overlaps(root.interval, target)) return true

    if (root.left && root.left.maxEnd > target.start) {
        return hasOverlap(root.left, target)
    }

    return hasOverlap(root.right, target)
}

export function buildIntervalTree(intervals: Interval[]) {
    let root: Node | null = null
    for (const i of intervals) root = insert(root, i)
    return root
}
