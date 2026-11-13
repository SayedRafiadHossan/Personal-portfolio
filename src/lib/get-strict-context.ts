import { createContext, createElement, useContext, type ReactNode } from "react"

function getStrictContext<T>(name?: string) {
  const Context = createContext<T | undefined>(undefined)

  const Provider = ({
    value,
    children,
  }: {
    value: T
    children?: ReactNode
  }) => createElement(Context.Provider, { value }, children)

  const useSafeContext = () => {
    const ctx = useContext(Context)
    if (ctx === undefined) {
      throw new Error(`useContext must be used within ${name ?? "a Provider"}`)
    }
    return ctx
  }

  return [Provider, useSafeContext] as const
}

export { getStrictContext }
