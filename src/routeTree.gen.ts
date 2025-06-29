/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SearchImport } from './routes/search'
import { Route as QuizzesImport } from './routes/quizzes'
import { Route as LeadersImport } from './routes/leaders'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const SearchRoute = SearchImport.update({
  id: '/search',
  path: '/search',
  getParentRoute: () => rootRoute,
} as any)

const QuizzesRoute = QuizzesImport.update({
  id: '/quizzes',
  path: '/quizzes',
  getParentRoute: () => rootRoute,
} as any)

const LeadersRoute = LeadersImport.update({
  id: '/leaders',
  path: '/leaders',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/leaders': {
      id: '/leaders'
      path: '/leaders'
      fullPath: '/leaders'
      preLoaderRoute: typeof LeadersImport
      parentRoute: typeof rootRoute
    }
    '/quizzes': {
      id: '/quizzes'
      path: '/quizzes'
      fullPath: '/quizzes'
      preLoaderRoute: typeof QuizzesImport
      parentRoute: typeof rootRoute
    }
    '/search': {
      id: '/search'
      path: '/search'
      fullPath: '/search'
      preLoaderRoute: typeof SearchImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/leaders': typeof LeadersRoute
  '/quizzes': typeof QuizzesRoute
  '/search': typeof SearchRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/leaders': typeof LeadersRoute
  '/quizzes': typeof QuizzesRoute
  '/search': typeof SearchRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/leaders': typeof LeadersRoute
  '/quizzes': typeof QuizzesRoute
  '/search': typeof SearchRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/leaders' | '/quizzes' | '/search'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/leaders' | '/quizzes' | '/search'
  id: '__root__' | '/' | '/leaders' | '/quizzes' | '/search'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LeadersRoute: typeof LeadersRoute
  QuizzesRoute: typeof QuizzesRoute
  SearchRoute: typeof SearchRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LeadersRoute: LeadersRoute,
  QuizzesRoute: QuizzesRoute,
  SearchRoute: SearchRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/leaders",
        "/quizzes",
        "/search"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/leaders": {
      "filePath": "leaders.tsx"
    },
    "/quizzes": {
      "filePath": "quizzes.tsx"
    },
    "/search": {
      "filePath": "search.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
