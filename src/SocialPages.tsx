import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { aureon } from './lib/aureon'

type Props={userId:string}
type Post={id:string;author_id:string;author_name:string;body:string;image?:string|null;created_at?:string}
type Comment={id:string;post_id:string;author_id:string;author_name:string;body:string;created_at?:string}
type Like={id:string;post_id:string;user_id:string}
type Message={id:string;author_id:string;author_name:string;body:string;created_at?:string}
type SocialProfile={id:string;user_id:string;display_name:string;bio?:string|null}

async function imageData(file:File){
 const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error);r.readAsDataURL(file)})
 if(data.length>1_800_000) throw new Error('large')
 return data
}
function when(v?:string){return v?new Date(v).toLocaleString('pt-BR'):'agora'}

export function CommunityPage({userId}:Props){
 const [posts,setPosts]=useState<Post[]>([]),[comments,setComments]=useState<Comment[]>([]),[likes,setLikes]=useState<Like[]>([])
 const [name,setName]=useState('Mulher Conexão Ela'),[body,setBody]=useState(''),[image,setImage]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
 async function load(){
  const [p,c,l,profiles]=await Promise.all([aureon.data.list<Post>('community_posts'),aureon.data.list<Comment>('community_comments'),aureon.data.list<Like>('community_likes'),aureon.data.list<SocialProfile>('community_profiles')])
  setPosts(p.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))));setComments(c);setLikes(l)
  const mine=profiles.find(x=>x.user_id===userId); if(mine?.display_name)setName(mine.display_name)
 }
 useEffect(()=>{void load()},[userId])
 async function pick(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;setError('');try{setImage(await imageData(f))}catch{setError('Escolha uma foto menor.')}}
 async function publish(e:FormEvent){e.preventDefault();if(!body.trim()&&!image)return;setBusy(true);try{await aureon.data.create('community_posts',{author_id:userId,author_name:name,body:body.trim(),image,created_at:new Date().toISOString()});setBody('');setImage(null);await load()}finally{setBusy(false)}}
 async function like(postId:string){const mine=likes.find(x=>x.post_id===postId&&x.user_id===userId);if(mine)await aureon.data.remove('community_likes',mine.id);else await aureon.data.create('community_likes',{post_id:postId,user_id:userId});await load()}
 async function comment(postId:string,text:string){if(!text.trim())return;await aureon.data.create('community_comments',{post_id:postId,author_id:userId,author_name:name,body:text.trim(),created_at:new Date().toISOString()});await load()}
 return <div className="page-stack"><section className="page-title"><span className="card-kicker">COMUNIDADE</span><h1>Entre Elas</h1><p>Um espaço para compartilhar, apoiar, conversar e crescer juntas.</p></section>
 <form className="card form-stack" onSubmit={publish}><textarea rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="O que você quer compartilhar hoje?" maxLength={1200}/>{image&&<img src={image} alt="Prévia" style={{width:'100%',maxHeight:360,objectFit:'cover',borderRadius:18}}/>}<div className="inline-form wrap"><label className="secondary-button" style={{cursor:'pointer'}}>📷 Adicionar foto<input hidden type="file" accept="image/*" onChange={pick}/></label><button className="primary-button compact" disabled={busy}>{busy?'Publicando…':'Publicar'}</button></div>{error&&<div className="form-message error">{error}</div>}</form>
 {posts.length===0&&<section className="card empty-copy">A comunidade está pronta. Faça a primeira publicação 💗</section>}
 {posts.map(p=><article className="card" key={p.id}><div className="section-heading"><div><strong>{p.author_name}</strong><small style={{display:'block'}}>{when(p.created_at)}</small></div><span className="soft-tag">Conexão Ela</span></div>{p.body&&<p style={{whiteSpace:'pre-wrap'}}>{p.body}</p>}{p.image&&<img src={p.image} alt="Publicação" style={{width:'100%',maxHeight:520,objectFit:'cover',borderRadius:18}}/>}<button className="secondary-button" onClick={()=>void like(p.id)}>♡ {likes.filter(x=>x.post_id===p.id).length} apoiar</button><div className="form-stack">{comments.filter(x=>x.post_id===p.id).map(c=><div key={c.id}><strong>{c.author_name}</strong> <span>{c.body}</span></div>)}<CommentBox onSend={t=>comment(p.id,t)}/></div></article>)}</div>
}
function CommentBox({onSend}:{onSend:(t:string)=>Promise<void>}){const[t,setT]=useState('');return <form className="inline-form" onSubmit={async e=>{e.preventDefault();await onSend(t);setT('')}}><input value={t} onChange={e=>setT(e.target.value)} placeholder="Escreva um comentário…"/><button className="secondary-button">Enviar</button></form>}

export function CommunityChatPage({userId}:Props){
 const [messages,setMessages]=useState<Message[]>([]),[text,setText]=useState(''),[name,setName]=useState('Mulher Conexão Ela')
 async function load(){const [m,p]=await Promise.all([aureon.data.list<Message>('community_messages'),aureon.data.list<SocialProfile>('community_profiles')]);setMessages(m.sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||''))));const mine=p.find(x=>x.user_id===userId);if(mine?.display_name)setName(mine.display_name)}
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),5000);return()=>clearInterval(id)},[userId])
 async function send(e:FormEvent){e.preventDefault();if(!text.trim())return;await aureon.data.create('community_messages',{author_id:userId,author_name:name,body:text.trim(),created_at:new Date().toISOString()});setText('');await load()}
 return <div className="page-stack"><section className="page-title"><span className="card-kicker">CHAT DA COMUNIDADE</span><h1>Conversa Entre Elas</h1><p>Conversa coletiva das mulheres aprovadas no Conexão Ela.</p></section><section className="card form-stack" style={{maxHeight:'60vh',overflow:'auto'}}>{messages.length===0&&<p className="muted">Comece a conversa 💗</p>}{messages.map(m=><div key={m.id} style={{alignSelf:m.author_id===userId?'flex-end':'flex-start',maxWidth:'85%'}}><strong>{m.author_name}</strong><div className="soft-tag" style={{whiteSpace:'normal',padding:10}}>{m.body}</div><small>{when(m.created_at)}</small></div>)}</section><form className="card inline-form" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Mensagem para a comunidade…" maxLength={1000}/><button className="primary-button compact">Enviar</button></form></div>
}
