import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Access from '../views/auth/Access.vue'
import Error from '../views/auth/Error.vue'
import Login from '../views/auth/Login.vue'
import AppLayoutUser from '../layout/bandeja/AppLayoutUser.vue'
import AppLayout from '@/layout/AppLayout.vue'
import tablatramitependiente from '@/views/pages/tablatramitependiente.vue'
import tablatramiteconcluido from '@/views/pages/tablatramiteconcluido.vue'
import inicio from '@/views/pages/inicio.vue'
import nuevoflujo from '@/views/pages/nuevoflujo.vue'

import panel from '@/views/admin/panel.vue'
import tramite from '@/views/admin/tramite.vue'
import seguimiento from '@/views/admin/seguimiento.vue'
import designacionTribunal from '@/views/admin/designacion tribunal.vue'
import perfilGrado from '@/views/admin/perfil grado.vue'

import firmar from '@/views/pages/firmar.vue'
import Formulario from '@/views/Formulario.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
      meta: {redirectIfAuth: true}
    },
    {
      path: '/firmar',
      name: 'firmar',
      component: firmar,
      props: route => ({ documento: route.params.documento }),
    },
    {
      path: '/formulario',
      name: 'formulario',
      component: Formulario
    },
    {
      path: '/',
      component: AppLayout,
      meta: {requireAuth: true},
      children: [
        {
          path: 'panel',
          component: panel
        },
        {
          path: 'tramite',
          component: tramite
        },
        {
          path: 'seguimiento',
          component: seguimiento
        },
        {
          path: 'perfilGrado',
          component: perfilGrado
        },
        {
          path: 'designacionTribunal',
          component: designacionTribunal
        },
      ]
    },
    {
      path: '/auth/access',
      name: 'Access',
      component: Access
    },
    {
      path: '/auth/error',
      name: 'Error',
      component: Error
    },
    {
      path: '/',
      component: AppLayoutUser,
      // meta: {requireAuth: true},
      children: [
        {
          path: 'inicio',
          name: 'inicio',
          component: inicio,
          meta: { redirectIfAuth: true }
        },
        {
          path: 'tramite-pendiente',
          component: tablatramitependiente
        },
        {
          path: 'tramite-concluido',
          component: tablatramiteconcluido
        },
        {
          path: 'nuevo-flujo',
          component: nuevoflujo
        },
        {
          path: 'hoja-ruta',
          component: () => import('@/views/pages/hojaRuta.vue') 
        },
      ]
    },
    {
      path: '/F1',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P7.vue') },
        { path: 'P8-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P8-Fin.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F1/P9.vue') },
      ]
    },
    {
      path: '/F2',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P5.vue') },
        { path: 'P6-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P6-Fin.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F2/P7.vue') },
      ]
    },
    {
      path: '/F3',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P7.vue') },
        { path: 'P8', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P8.vue') },
        { path: 'P9-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P9-Fin.vue') },
        { path: 'P10', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F3/P10.vue') },
      ]
    },
    {
      path: '/F4',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P7.vue') },
        { path: 'P8', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P8.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P9.vue') },
        { path: 'P10-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P10-Fin.vue') },
        { path: 'P11', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F4/P11.vue') },
      ]
    },
    {
      path: '/F5',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P5.vue') },
        { path: 'P6-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F5/P6-Fin.vue') },
      ]
    },
    {
      path: '/F6',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P5.vue') },
        { path: 'P6-Fin', component: () => import('@/views/flujos/ACADEMICO/1_Kardex/F6/P6-Fin.vue') },
      ]
    },
    {
      path: '/F7',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P7.vue') },
        { path: 'P8', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P8.vue') },
        { path: 'P9-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F7/P9-Fin.vue') },
      ]
    },
    {
      path: '/F8',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P6.vue') },
        { path: 'P7-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P7-Fin.vue') },
      ]
    },
    {
      path: '/F9',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P5.vue') },
        { path: 'P6-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P6-Fin.vue') },
      ]
    },
    {
      path: '/F17',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P7.vue') },
        { path: 'P8-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P8-Fin.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F17/P9.vue') },
      ]
    },
    {
      path: '/F18',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P7.vue') },
        { path: 'P8-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P8-Fin.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F18/P9.vue') },
      ]
    },
    {
      path: '/F19',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P7.vue') },
        { path: 'P8-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P8-Fin.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F19/P9.vue') },
      ]
    },
  ]
})
router.beforeEach((to, from, next) => {
  let token = localStorage.getItem("access_token");

  if(to.meta.requireAuth){
    if(!token)
      return next({name: 'Login'})
    return next()
  }

  if(to.meta.redirectIfAuth && token) {
    if (to.name !== 'inicio') {
      return next({ name: 'inicio' });
    }
  }

  return next()

})


export default router
