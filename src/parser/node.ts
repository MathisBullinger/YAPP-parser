export default class Node {
  public readonly children: Node[] = []
  constructor(public readonly name: string, public readonly parent?: Node) {}

  push(name: string) {
    const child = new Node(name, this)
    this.children.push(child)
    return child
  }

  get root() {
    if (!this.parent) return this
    return this.parent.root
  }

  printBranch() {
    let node: Node = this
    const branch = []
    while (node) {
      branch.push(node)
      node = node.parent
    }
    return branch
      .map(({ name }) => name)
      .reverse()
      .join(' -> ')
  }
}
