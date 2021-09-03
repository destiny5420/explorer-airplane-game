import 'main.scss'
import '@/js/common/common'
import App from './App'

const app = new App()

/*!
 * -- Preload Sample --
 *
 * 1. The picture that be compressed by webpack at images folder
 * import logoImage from '@/images/tmpPic.png'
 * document.getElementById('logo').src = logoImage
 *
 * 2. The image at static folder
 * document.getElementById('logo').src = './static/images/logo.png'
 */
