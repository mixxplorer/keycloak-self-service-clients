import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home', path: '', component: () => import('pages/IndexPage.vue') },
      {
        name: 'ClientsList',
        meta: {
          title: 'Clients',
          requiresAuth: true,
        },
        path: 'clients',
        component: () => import('pages/Clients.vue'),
      },
      {
        name: 'ClientAdd',
        meta: {
          title: 'New Client',
          requiresAuth: true,
        },
        path: 'client/new',
        component: () => import('pages/ClientEdit.vue'),
      },
      {
        name: 'ClientEdit',
        meta: {
          title: 'Edit Client',
          requiresAuth: true,
        },
        path: 'clients/:clientUuid',
        component: () => import('pages/ClientEdit.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
