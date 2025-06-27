import { MenuItemType } from '../../types/menu'
import appMenu from '@/components/layout/VerticalNavigationBar/components/AppMenu.tsx'
import { useAuthContext } from '@/context/useAuthContext'


const opciones = "[{ key: '24', label:'Seguridad', isTitle: true, }, { key: '17', label: 'Opciones', icon: 'tabler:lock', children:[ { key: '34', label:'Menu', url:'menu', parentKey:'17', }, { key: '36', label:'Modulo', url:'modulo', parentKey:'17', }, { key: '37', label:'Opcion', url:'opcion', parentKey:'17', }, { key: '38', label:'Empresa', url:'empresas', parentKey:'17', }, ]}, { key: '20', label: 'Usuarios', icon: 'tabler:alien', children:[ { key: '39', label:'Rol', url:'rol', parentKey:'20', }, { key: '40', label:'Opciones rol', url:'RolOpcion', parentKey:'20', }, { key: '41', label:'Usuario', url:'usuario', parentKey:'20', }, { key: '42', label:'Usuario rol', url:'RolUsuario', parentKey:'20', }, ]}, ]"
 
export const MENU_ITEMS: MenuItemType[] = []
export const HORIZONTAL_MENU_ITEM: MenuItemType[] = []

