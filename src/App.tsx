import {useMemo, useState} from 'react'
import {AlertCircle, ArrowRightLeft, Check, Copy, ExternalLink, Link2, X} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'

import {CONFIG, generateShortUrl, type UtmSourceValue} from '@/lib/shortener'

const placeholderUrl = `${CONFIG.BASE_URL}?…`

export default function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [utmSource, setUtmSource] = useState<UtmSourceValue | ''>('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [copied, setCopied] = useState(false)

  const {shortUrl, error} = useMemo(() => {
    const {result, error} = generateShortUrl(inputUrl, utmSource, utmCampaign)
    return {shortUrl: result || '', error}
  }, [inputUrl, utmSource, utmCampaign])

  const handleCopy = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ArrowRightLeft className="h-6 w-6 text-primary"/>
          </div>
          <CardTitle className="text-2xl">WfF Shortlinks</CardTitle>
          <CardDescription>
            Erstelle Shortlinks für Inhalte auf wff-berlin.de.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Eingabe URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Original URL ({CONFIG.BASE_URL})</Label>
            <div className="relative">
              <Input
                id="url"
                placeholder={placeholderUrl}
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value)
                  setCopied(false)
                }}
                className={`pr-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {inputUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setInputUrl('')}
                >
                  <X className="h-4 w-4"/>
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4"/> {error}
              </p>
            )}
          </div>

          {/* UTM Parameter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UTM Source */}
            <div className="space-y-2">
              <Label>UTM Source</Label>
              <div className="flex gap-2">
                <Select value={utmSource} onValueChange={(value) => {
                  setUtmSource(value as UtmSourceValue | '')
                  setCopied(false)
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wähle Quelle"/>
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIG.UTM_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {utmSource && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setUtmSource('')}
                    title="Auswahl löschen"
                  >
                    <X className="h-4 w-4"/>
                  </Button>
                )}
              </div>
            </div>

            {/* UTM Campaign */}
            <div className="space-y-2">
              <Label htmlFor="campaign">UTM Campaign</Label>
              <div className="relative">
                <Input
                  id="campaign"
                  placeholder="z.B. nl2512"
                  value={utmCampaign}
                  onChange={(e) => {
                    setUtmCampaign(e.target.value)
                    setCopied(false)
                  }}
                  className="pr-10"
                />
                {utmCampaign && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setUtmCampaign('')}
                  >
                    <X className="h-4 w-4"/>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Ergebnis Footer */}
        <CardFooter className="flex flex-col items-start gap-4 border-t bg-muted/20 p-6">
          <Label>Generierter Shortlink</Label>
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={shortUrl}
                className="bg-background pr-10 font-mono text-sm"
                placeholder="Ergebnis erscheint hier …"
              />
              <div className="absolute right-3 top-2.5 text-muted-foreground">
                <Link2 className="h-4 w-4 opacity-50"/>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!shortUrl}
              aria-label={copied ? 'Link kopiert' : 'Link kopieren'}
              className={copied ? 'text-green-600 border-green-600 hover:text-green-700 hover:bg-green-50' : ''}
            >
              {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
            </Button>

            <Button
              size="icon"
              disabled={!shortUrl}
              asChild
            >
              <a href={shortUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4"/>
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="fixed bottom-4 text-xs text-muted-foreground">
        WfF Berlin-Brandenburg e.V. &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}
