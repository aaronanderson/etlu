export async function svgIcon(src: string, options?: SVGOptions){
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  let response = await fetch(src);
  let text = await response.text();
  const parsed = parser.parseFromString(text, 'text/html');
  const icon = parsed.querySelector('svg');
  //icon.setAttribute("fill",color);

 if (options){
    for (const el of icon.querySelectorAll('.wd-icon-fill')){
      el.setAttribute("fill",options.color);
    }
    for (const el of icon.querySelectorAll('.wd-icon-accent')){
      el.setAttribute("fill",options.accentColor? options.accentColor: options.color );
    }
    for (const el of icon.querySelectorAll('.wd-icon-background')){
      el.setAttribute("fill", options.backgroundColor? options.backgroundColor : 'transparent');
    }



    if (options.viewBox){
      icon.setAttribute("viewBox",options.viewBox);
      icon.setAttribute("preserveAspectRatio", options.preserveAspectRatio? options.preserveAspectRatio : "xMidYMid meet");
    }
  }
  const s = serializer.serializeToString(icon);
  //const svgURI = "data:image/svg+xml;base64," + window.btoa(s);
  const svgURI = "data:image/svg+xml; charset=utf8," + s;
  return svgURI;


}

export interface SVGOptions {
 color: string;
 accentColor?: string;
 backgroundColor?: string;
 viewBox?: string;
 preserveAspectRatio?: string;

}
