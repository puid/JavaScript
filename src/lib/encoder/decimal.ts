export default (): PuidEncoder => {
  const decimal = '0'.charCodeAt(0)

  return (n: number) => n + decimal
}
