require("dotenv").config();
const express=require("express"),path=require("path"),nodemailer=require("nodemailer");
const app=express(),PORT=process.env.PORT||3000;
app.use(express.json({limit:"20kb"}));app.use(express.static(path.join(__dirname,"..","public")));
function transporter(){
 if(!process.env.SMTP_USER||!process.env.SMTP_PASS)return null;
 if(process.env.SMTP_SERVICE)return nodemailer.createTransport({service:process.env.SMTP_SERVICE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
 return nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE).toLowerCase()==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
app.get("/api/health",(_,r)=>r.json({ok:true,service:"portfolio-api"}));
app.get("/api/email-status",async(_,r)=>{const t=transporter();if(!t||!process.env.CONTACT_TO)return r.status(503).json({ok:false,configured:false,message:"Email credentials are not configured."});try{await t.verify();r.json({ok:true,configured:true,message:"SMTP connection verified."});}catch(e){console.error(e.message);r.status(503).json({ok:false,configured:true,message:"SMTP connection failed. Check email settings."});}});
app.post("/api/contact",async(req,res)=>{
 const {name,email,message,website}=req.body||{};if(website)return res.json({ok:true});
 const valid=typeof email==="string"&&/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
 if(typeof name!=="string"||name.trim().length<2||name.length>80||!valid||typeof message!=="string"||message.trim().length<10||message.length>4000)return res.status(400).json({ok:false,message:"Please enter your name, a valid email address and a message of at least 10 characters."});
 const t=transporter();if(!t||!process.env.CONTACT_TO)return res.status(503).json({ok:false,message:"Email is not configured yet. Add SMTP credentials to the server .env file."});
 try{await t.sendMail({from:process.env.CONTACT_FROM||process.env.SMTP_USER,to:process.env.CONTACT_TO,replyTo:email,subject:`Portfolio contact form: ${name.trim()}`,text:`Name: ${name.trim()}\\nEmail: ${email}\\n\\n${message.trim()}`,html:`<h2>New portfolio message</h2><p><b>Name:</b> ${esc(name.trim())}</p><p><b>Email:</b> ${esc(email)}</p><p>${esc(message.trim()).replace(/\\n/g,"<br>")}</p>`});res.json({ok:true,message:"Your message has been sent successfully. Thank you!"});}
 catch(e){console.error("Contact email error:",e.message);res.status(500).json({ok:false,message:"The message could not be sent. Please try again later."});}
});
app.listen(PORT,()=>console.log(`Portfolio running at http://localhost:${PORT}`));
