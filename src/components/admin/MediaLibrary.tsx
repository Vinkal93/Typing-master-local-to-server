import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Trash2, Copy, Upload, Link as LinkIcon } from "lucide-react";
import { getMedia, addMedia, deleteMedia, MediaItem } from "@/lib/adminBlogStore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  selectMode?: boolean;
  onSelect?: (url: string) => void;
}

export const MediaLibrary = ({ selectMode, onSelect }: Props) => {
  const [items, setItems] = useState<MediaItem[]>(getMedia());
  const [search, setSearch] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reload = () => setItems(getMedia());

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    addMedia({ url: urlInput, alt: altInput });
    setUrlInput(""); setAltInput("");
    reload();
    toast({ title: "Image added" });
  };

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB. Use Imgur for large images.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      addMedia({ url: reader.result as string, alt: file.name, size: file.size });
      reload();
      toast({ title: "Uploaded", description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied" });
  };

  const remove = (id: string) => {
    deleteMedia(id);
    reload();
  };

  const filtered = items.filter(i => i.alt.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Media Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-3 w-3 mr-1" /> Upload</Button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Input placeholder="Or paste image URL" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
          <Input placeholder="Alt text" value={altInput} onChange={e => setAltInput(e.target.value)} className="sm:max-w-[200px]" />
          <Button size="sm" onClick={addByUrl} variant="outline"><LinkIcon className="h-3 w-3 mr-1" /> Add</Button>
        </div>
        <Input placeholder="Search by alt text..." value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No media yet. Upload to get started.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(item => (
              <div key={item.id} className="border rounded overflow-hidden group relative">
                <img src={item.url} alt={item.alt} className="w-full h-24 object-cover" />
                <div className="p-2 space-y-1">
                  <p className="text-[10px] truncate text-foreground">{item.alt || "no alt"}</p>
                  <div className="flex gap-1">
                    {selectMode ? (
                      <Button size="sm" className="h-6 text-[10px] flex-1" onClick={() => onSelect?.(item.url)}>Insert</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => copyUrl(item.url)}>
                        <Copy className="h-2.5 w-2.5 mr-1" /> Copy
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => remove(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaLibrary;
