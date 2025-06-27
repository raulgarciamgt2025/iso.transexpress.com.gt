import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { UsersType } from '@/types/auth'
import { API_URL } from '../../../../configs/apiConfig'
import SHA1 from "crypto-js/sha1";


const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
  const [searchParams] = useSearchParams()

  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string().required('Por favor ingrese el usuario'),
    password: yup.string().required('Por favor ingrese la contraseña'),
    empresa: yup.string().required('Por favor seleccione una empresa'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  interface data {
    login_usuario: string;
    contrasena: string;
    id_empresa: string;

  }

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')

    if (redirectLink) navigate(redirectLink)
    else navigate('/')
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {

      setLoading(true)
      const payload: data = {
        login_usuario: values.email,
        contrasena: SHA1(values.password).toString(),
        id_empresa: values.empresa
      };

      const url = `${API_URL}Usuario/login`

      const response = await fetch(`${API_URL}Usuario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json()
      const { data, mensaje, estado, accesos } = result


      if (estado == true && mensaje != "" && data.length > 0) {
        const { id_usuario, nombre_usuario, email } = data[0]


        const sessionData: UsersType = {
          id: id_usuario.toString(),
          username: payload.login_usuario,
          email: email,
          password: email,
          firstName: nombre_usuario,
          lastName: nombre_usuario,
          role: 'user',
          token: mensaje,
          id_empresa: values.empresa,
          accesos: accesos
        }


        saveSession({
          ...(sessionData ?? {}),
          token: mensaje
        });

        redirectUser()
        showNotification({ message: 'Login existoso. Ingresando....', variant: 'success' })
      }
      else {

        showNotification({ message: "Usuario o contraseña incorrectos", variant: 'danger' })
      }


    } catch (e: any) {
      if (e.response?.data?.error) {
        showNotification({ message: e.response?.data?.error, variant: 'danger' })
      }
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
