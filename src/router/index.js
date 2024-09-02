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

import f1p1 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P1.vue'
import f1p2 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P2.vue'
import f1p3 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P3.vue'
import f1p4 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P4.vue'
import f1p5 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P5.vue'
import f1p6 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P6.vue'
import f1p7 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P7.vue'
import f1p8 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P8-Fin.vue'
import f1p9 from '@/views/flujos/ACADEMICO/1_Kardex/F1/P9.vue'

import f2p1 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P1.vue'
import f2p2 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P2.vue'
import f2p3 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P3.vue'
import f2p4 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P4.vue'
import f2p5 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P5.vue'
import f2p6 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P6-Fin.vue'
import f2p7 from '@/views/flujos/ACADEMICO/1_Kardex/F2/P7.vue'

import f3p1 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P1.vue'
import f3p2 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P2.vue'
import f3p3 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P3.vue'
import f3p4 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P4.vue'
import f3p5 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P5.vue'
import f3p6 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P6.vue'
import f3p7 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P7.vue'
import f3p8 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P8.vue'
import f3p9 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P9-Fin.vue'
import f3p10 from '@/views/flujos/ACADEMICO/1_Kardex/F3/P10.vue'

import f4p1 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P1.vue'
import f4p2 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P2.vue'
import f4p3 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P3.vue'
import f4p4 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P4.vue'
import f4p5 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P5.vue'
import f4p6 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P6.vue'
import f4p7 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P7.vue'
import f4p8 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P8.vue'
import f4p9 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P9.vue'
import f4p10 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P10-Fin.vue'
import f4p11 from '@/views/flujos/ACADEMICO/1_Kardex/F4/P11.vue'

import f5p1 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P1.vue'
import f5p2 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P2.vue'
import f5p3 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P3.vue'
import f5p4 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P4.vue'
import f5p5 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P5.vue'
import f5p6 from '@/views/flujos/ACADEMICO/1_Kardex/F5/P6-Fin.vue'

import f6p1 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P1.vue'
import f6p2 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P2.vue'
import f6p3 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P3.vue'
import f6p4 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P4.vue'
import f6p5 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P5.vue'
import f6p6 from '@/views/flujos/ACADEMICO/1_Kardex/F6/P6-Fin.vue'


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
        { path: 'P1', component: f1p1 },
        { path: 'P2', component: f1p2 },
        { path: 'P3', component: f1p3 },
        { path: 'P4', component: f1p4 },
        { path: 'P5', component: f1p5 },
        { path: 'P6', component: f1p6 },
        { path: 'P7', component: f1p7 },
        { path: 'P8-Fin', component: f1p8 },
        { path: 'P9', component: f1p9 },
      ]
    },
    {
      path: '/F2',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: f2p1 },
        { path: 'P2', component: f2p2 },
        { path: 'P3', component: f2p3 },
        { path: 'P4', component: f2p4 },
        { path: 'P5', component: f2p5 },
        { path: 'P6-Fin', component: f2p6 },
        { path: 'P7', component: f2p7 },
      ]
    },
    {
      path: '/F3',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: f3p1 },
        { path: 'P2', component: f3p2 },
        { path: 'P3', component: f3p3 },
        { path: 'P4', component: f3p4 },
        { path: 'P5', component: f3p5 },
        { path: 'P6', component: f3p6 },
        { path: 'P7', component: f3p7 },
        { path: 'P8', component: f3p8 },
        { path: 'P9-Fin', component: f3p9 },
        { path: 'P10', component: f3p10 },
      ]
    },
    {
      path: '/F4',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: f4p1 },
        { path: 'P2', component: f4p2 },
        { path: 'P3', component: f4p3 },
        { path: 'P4', component: f4p4 },
        { path: 'P5', component: f4p5 },
        { path: 'P6', component: f4p6 },
        { path: 'P7', component: f4p7 },
        { path: 'P8', component: f4p8 },
        { path: 'P9', component: f4p9 },
        { path: 'P10-Fin', component: f4p10 },
        { path: 'P11', component: f4p11 },
      ]
    },
    {
      path: '/F5',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: f5p1 },
        { path: 'P2', component: f5p2 },
        { path: 'P3', component: f5p3 },
        { path: 'P4', component: f5p4 },
        { path: 'P5', component: f5p5 },
        { path: 'P6-Fin', component: f5p6 },
      ]
    },
    {
      path: '/F6',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: f6p1 },
        { path: 'P2', component: f6p2 },
        { path: 'P3', component: f6p3 },
        { path: 'P4', component: f6p4 },
        { path: 'P5', component: f6p5 },
        { path: 'P6-Fin', component: f6p6 },
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
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P7.vue') },
        { path: 'P8', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P8.vue') },
        { path: 'P9-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F8/P9-Fin.vue') },
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
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P6.vue') },
        { path: 'P7-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F9/P7-Fin.vue') },
      ]
    },
    {
      path: '/F10',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P5.vue') },
        { path: 'P6-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F10/P6-Fin.vue') },
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
    {
      path: '/F24',
      //meta: {requireAuth: true},
      children: [
        { path: 'P1', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P1.vue') },
        { path: 'P2', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P2.vue') },
        { path: 'P3', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P3.vue') },
        { path: 'P4', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P4.vue') },
        { path: 'P5', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P5.vue') },
        { path: 'P6', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P6.vue') },
        { path: 'P7', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P7.vue') },
        { path: 'P8-Fin', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P8-Fin.vue') },
        { path: 'P9', component: () => import('@/views/flujos/ACADEMICO/2_Secretarias/F24/P9.vue') },
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
