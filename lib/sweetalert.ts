"use client"

import Swal from "sweetalert2"

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#141417",
  color: "#fafafa",
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export const showSuccess = (title: string, text?: string) => {
  return Toast.fire({
    icon: "success",
    title,
    text,
  })
}

export const showError = (title: string, text?: string) => {
  return Toast.fire({
    icon: "error",
    title,
    text,
  })
}

export const showWarning = (title: string, text?: string) => {
  return Toast.fire({
    icon: "warning",
    title,
    text,
  })
}

export const showInfo = (title: string, text?: string) => {
  return Toast.fire({
    icon: "info",
    title,
    text,
  })
}

export const confirmAction = async (title: string, text: string, confirmText = "Ya", cancelText = "Batal") => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#ef4444",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: "#141417",
    color: "#fafafa",
  })

  return result.isConfirmed
}

export const showConfirm = confirmAction

export const showLoading = (title = "Memproses...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
    background: "#141417",
    color: "#fafafa",
  })
}

export const closeLoading = () => {
  Swal.close()
}
