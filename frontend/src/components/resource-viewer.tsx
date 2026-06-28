// file for viewing the file resource type
// it will have recent views 15 minutes ago to the left and to the right is the viewing of the resource
// its a modal 
import { useResource } from "@/hooks/useResource"
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingThree } from "./loading";
import { Button } from "./ui/button";
import { ArrowLeftFromLine, Calendar1Icon } from "lucide-react";
import { formatDate } from "@/utils/time";
import { getExtension } from "@/utils/urls";
import { type UserProps } from "@/types/models";

interface ResourceInformationProps {
    collapse: boolean,
    groupId:string | undefined,
    name:string,
    description:string,
    uploader_detail:UserProps,
    created_at:string
}


interface ResourcePlatformProps {
    url:string,
    collapse:boolean
}

export const ResourceViewer = () => {
    const { resourceId, groupId } = useParams();
    const hasRecorded = useRef(false);

    const { 
        data, isFetching, 
        resourceViews, recordView, 
        resourceDownloads, recordDownload,
    } = useResource(Number(resourceId));
    // record the view when opening this page



    const handleDownload =  async () => {
        recordDownload({ resourceId: Number(id), groupId: Number(groupId) })
    }

    useEffect(()=>{
        console.log(data)
        if (!resourceId && groupId) return
        if (hasRecorded.current) return;
        hasRecorded.current = true;
        recordView({ resourceId: Number(resourceId), groupId: Number(groupId) });
    },[resourceId, groupId, recordView])


    if (isFetching || !data){
        return <LoadingThree/>
    }


    return (
        <div className="">
            <ResourceInformation
            collapse={false}
            groupId={groupId}
            name={data.name}
            description={data.description}
            uploader_detail={data.uploader_detail}
            created_at={data.created_at}
            />


            <ResourcePlatform
            url={data.url}
            collapse={false}
            />


        </div>
    )
}



const ResourceInformation = ({collapse, groupId,  name, description, uploader_detail, created_at }:ResourceInformationProps) => {
    return (
        <aside
            aria-label="Resource information"
            className={`
                fixed left-0 top-0 z-40 flex h-full flex-col
                border-r border-sidebar-border bg-sidebar text-sidebar-foreground
                transition-[width] duration-300 ease-in-out overflow-hidden
                ${collapse ? "w-16" : "w-64"}
            `}
        >
            {/* back button */}
            <Button
            variant={'outline'}
            className="rounded-none border-none"
            >
                <Link
                className="flex flex-row-reverse w-full justify-between items-center"
                to={`/groups/${groupId}`}
                >
                <ArrowLeftFromLine/>
                <p>Back</p>
                </Link>
            </Button>
            

            {/* information */}
            <div className={`transition-opacity duration-300 ${collapse ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

                <div className="p-5">

                    <p>
                        <span className="uppercase block text-sm text-muted-foreground">Resource</span>
                        <span>{name}</span>
                    </p>

                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <span className="inline-block"><Calendar1Icon size={'15'}/></span>
                        <span>{formatDate(created_at)}</span>
                    </p>
                </div>

                <hr/>

                <p className="p-5">
                    <span className="uppercase block text-sm text-muted-foreground">Description</span>
                    <span className="text-sm">{description}</span>
                </p> 

                <hr/>

                {
                    uploader_detail && (
                        <>

                            <div className="p-5">
                                <span className="uppercase block text-sm text-muted-foreground mb-2">Uploaded by</span>
                                <div className="flex items-center gap-2">
                                    {/* avatar */}
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <img
                                        className="w-full h-full object-cover"
                                        src={uploader_detail.avatar?? ""} alt={uploader_detail.name} />
                                    </div>

                                    <p className="flex flex-col gap-0 leading-tight">
                                        <span className="font-medium">
                                            {uploader_detail.first_name} {uploader_detail.last_name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">{uploader_detail.email}</span>
                                    </p>

                                </div>
                            </div>     
                    
                        </>
                    )
                }

            </div>


    </aside>
    )
}



const ResourcePlatform = ({url, collapse}:ResourcePlatformProps) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fileType = getFileType(url);
    const isOffice = ['word', 'powerpoint', 'excel'].includes(fileType);
    const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    // only access if pdf file
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  useEffect(() => {
    console.log(fileType)
        if (!url) return;

        // Office files → Microsoft Viewer handles it, no blob needed
        if (isOffice || fileType === 'image') {
            setLoading(false);
            return;
        }
        // Everything else → fetch as blob
        setLoading(true);
        setError(false);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.blob();
            })
            .then(blob => setBlobUrl(URL.createObjectURL(blob)))
            .catch(() => setError(true))
            .finally(() => setLoading(false));

        return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }, [url]);

    const mainClass = `flex-1 min-h-screen transition-all duration-300 ${collapse ? "ml-16" : "ml-64"}`;

    if (loading) return <LoadingThree/>

    if (error) return (
        <main className={mainClass}>
            <div className="flex flex-col items-center justify-center h-screen gap-3">
                <p className="text-destructive">Failed to load file.</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-sm underline text-muted-foreground">
                    Open in new tab
                </a>
            </div>
        </main>
    );


    return (
        <main
            className={mainClass}
        >

            {/* office files → Microsoft Viewer */}
            {isOffice && (
                <iframe
                    src={microsoftViewerUrl}
                    width="100%"
                    style={{ minHeight: '100vh', border: 'none', display: 'block' }}
                />
            )}

            {/* pdf → google viewer */}
            {fileType === 'pdf' && (
                <iframe
                    src={googleViewerUrl}
                    width="100%"
                    style={{ minHeight: '100vh', display: 'block', border: 'none' }}
                />
            )}


            {/* image */}
            {fileType === 'image' && (
                <div className="flex items-center justify-center min-h-screen bg-muted/20 p-6">
                    <img
                        src={url}
                        alt="Resource"
                        className="max-w-full max-h-screen object-contain rounded-md"
                    />
                </div>
            )}

            {/* video */}
            {fileType === 'video' && (
                <div className="flex items-center justify-center min-h-screen bg-black">
                    <video controls className="max-w-full max-h-screen">
                        <source src={blobUrl!} />
                    </video>
                </div>
            )}

            {/* audio */}
            {fileType === 'audio' && (
                <div className="flex items-center justify-center min-h-screen">
                    <audio controls className="w-full max-w-lg">
                        <source src={blobUrl!} />
                    </audio>
                </div>
            )}

            {/* unknown or other → fallback */}
            {fileType === 'other' && (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground">
                    <p>Preview not available for this file type.</p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-md border border-border hover:bg-muted transition text-sm"
                    >
                        Open / Download file
                    </a>
                </div>
            )}

        </main>
    )
}


const getFileType = (url: string): string => {
    const ext = getExtension(url)
    
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav'].includes(ext)) return 'audio';
    return 'other';
};