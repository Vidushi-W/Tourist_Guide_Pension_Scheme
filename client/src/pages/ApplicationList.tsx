import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api';import type { ListApplication } from '../types';import { StatusChip } from '../components/StatusChip';
export function ApplicationList(){const[apps,setApps]=useState<ListApplication[]>([]);const[error,setError]=useState('');const nav=useNavigate();useEffect(()=>{api.get('/applications').then(r=>setApps(r.data.data)).catch(e=>setError(errorMessage(e)))},[]);return <><Typography variant="h4" sx={{mb:3}}>My applications</Typography>{error&&<Alert severity="error">{error}</Alert>}<Stack spacing={1.5}>{apps.map(a=><Card key={a.id} sx={{cursor:'pointer'}} onClick={()=>nav(`/applicant/applications/${a.id}`)}><CardContent><Stack direction="row" justifyContent="space-between"><div><Typography fontWeight={700}>{a.applicationNumber??'Draft application'}</Typography><Typography color="text.secondary" variant="body2">Created {new Date(a.createdAt).toLocaleDateString()}</Typography></div><StatusChip status={a.status}/></Stack></CardContent></Card>)}</Stack></>}

