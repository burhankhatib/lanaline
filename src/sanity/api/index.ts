import toastHandler from './toast'

export async function POST(req: Request) {
  return toastHandler(req)
} 