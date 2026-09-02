import { useRef } from "react"
import { FileUpload, Text, chakra } from "@chakra-ui/react"

const UploadIcon = chakra("svg", {
  base: {
    boxSize: "6",
    color: "fg.muted",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
})

interface ImageDropzoneProps {
  onImageReady: (image: HTMLImageElement) => void
}

export function ImageDropzone({ onImageReady }: ImageDropzoneProps) {
  const objectUrlRef = useRef<string | null>(null)

  async function handleFileAccept(details: { files: File[] }) {
    const file = details.files[0]
    if (!file) return

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url

    const img = new Image()
    img.src = url
    await img.decode()
    onImageReady(img)
  }

  return (
    <FileUpload.Root width="full" accept="image/*" maxFiles={1} onFileAccept={handleFileAccept}>
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone width="full" minHeight="auto" py="6">
        <UploadIcon viewBox="0 0 24 24">
          <path d="M12 16V4" />
          <path d="m6 10 6-6 6 6" />
          <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
        </UploadIcon>
        <FileUpload.DropzoneContent>
          <Text fontWeight="medium">Drag an image here, or click to choose one</Text>
          <Text fontSize="sm" color="fg.muted">
            PNG, JPG, or WEBP
          </Text>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
    </FileUpload.Root>
  )
}
