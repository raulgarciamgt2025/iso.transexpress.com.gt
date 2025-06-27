import TextFormInput from '@/components/form/TextFormInput'
import useSignIn from '../useSignIn'
import PasswordFormInput from '@/components/form/PasswordFormInput'

import { FormCheck } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SelectFormInput from '@/components/form/SelectFormInput'
import { API_URL } from '../../../../../configs/apiConfig'
import { useEffect,useState } from 'react'

 

const LoginForm = () => {
  const { login, control } = useSignIn()
 const [opciones, setOpciones] = useState([])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch(`${API_URL}Empresa/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching empresas');
      }

      const empresas = await response.json();
      return empresas;
    } catch (error) {
      console.error('Error fetching empresas:', error);
      return { estado: false, mensaje: 'Error al cargar las empresas', data: [] };
    }
  }
    useEffect(() => {
    const fetchData = async () => {
      const empresas = await fetchEmpresas();
      if (empresas.estado) {
        const opts = empresas.data.map((empresa) => ({
          value: empresa.id_empresa,
          label: empresa.nombre,
        }));
        setOpciones(opts);
      } else {
        console.error(empresas.mensaje);
      }
    };

    fetchData();
  }, []);
  return (
    <form action="" className="text-start mb-3" onSubmit={login}>
      <div className="mb-3">
        <TextFormInput control={control} name="email" containerClassName="mb-3" label="Usuario" id="email-id" placeholder="Ingrese su usuario" />
      </div>
      <div className="mb-3">
        <PasswordFormInput
          control={control}
          name="password"
          containerClassName="mb-3"
          placeholder="Ingrese su contraseña"
          id="password-id"
          label="Contraseña"
        />
      </div>
      <div className="mb-3">
        <SelectFormInput options={opciones} control={control} name="empresa" containerClassName="mb-3" label="Empresa" id="empresa-id" placeholder="Ingrese la empresa" />
      </div>
      <div className="d-flex justify-content-between mb-3">
        <div className="form-check">
          <FormCheck className="ps-0" label="Recordarme" id="sign-in" />
        </div>
        <Link to="/auth/recover-password" className="text-muted border-bottom border-dashed">
          Olvido su contraseña
        </Link>
      </div>
      <div className="d-grid">
        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </div>
    </form>
  )
}

export default LoginForm
