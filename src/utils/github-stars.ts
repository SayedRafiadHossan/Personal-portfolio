/** Star counts keyed by "owner/name". Refreshed at most once a day; a failed repo is left out. */
export const getGitHubStars = async (
  repos: string[]
): Promise<Record<string, number>> => {
  const entries = await Promise.all(
    repos.map(async (repo) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 60 * 60 * 24 },
        })
        if (!res.ok) return null
        const { stargazers_count } = (await res.json()) as {
          stargazers_count?: number
        }
        return typeof stargazers_count === "number"
          ? ([repo, stargazers_count] as const)
          : null
      } catch {
        return null
      }
    })
  )
  return Object.fromEntries(entries.filter((entry) => entry !== null))
}
