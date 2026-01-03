export async function fetchBugs(product: string) {
    const res = await fetch(`/api/bugs?product=${product}`);
    const raw = await res.json();

    const bugsArray = raw.items || [];  // <-- EZ A VÁLTOZÁS!
    if (!Array.isArray(bugsArray)) return [];

    return bugsArray;
}
