<%@ WebHandler Language="C#" Class="myGenericHandler" %>

using System;
using System.IO;
using System.Net;
using System.Web;


public class myGenericHandler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        try
        {
            string input = new StreamReader(context.Request.InputStream).ReadToEnd();
            context.Response.Write("input=" + input + "\n");

            string path = HttpContext.Current.Server.MapPath("/UploadedFiles\\");
            //context.Response.Write("MapPath=" + path + "\n");
            
            StreamWriter fp = File.CreateText(path + "Camera-" + Guid.NewGuid().ToString() + ".txt");
            fp.WriteLine(input);
            fp.Close();
            context.Response.Write("Success!");
        }
        catch (Exception ex)
        {
            context.Response.Write("Error :" + ex.Message);
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }


}
