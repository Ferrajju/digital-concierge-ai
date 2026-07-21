import { Outlet } from 'react-router-dom'
import { HostScreenProvider } from '../../context/HostScreenContext'
import HostHelpWidget from '../ui/HostHelpWidget'

export default function PropietarioAppLayout() {
  return (
    <HostScreenProvider>
      <Outlet />
      <HostHelpWidget />
    </HostScreenProvider>
  )
}
