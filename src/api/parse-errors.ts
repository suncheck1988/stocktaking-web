async function parseErrors (response: Response) {
  if (response.status === 400) {
    const data = await response.json()
    return data.errors
  }

  return []
}

export default parseErrors
