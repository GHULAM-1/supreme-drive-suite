import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (data) setLogs(data);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT": return "bg-green-500";
      case "UPDATE": return "bg-blue-500";
      case "DELETE": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-gradient-metal">Audit Logs</h1>
      <p className="text-muted-foreground">Security audit trail for pricing and configuration changes</p>

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  <span className="text-sm font-medium">{log.table_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "PPpp")}
                  </span>
                </div>

                {log.old_values && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Old Values</summary>
                    <pre className="mt-2 p-2 bg-secondary/30 rounded text-xs overflow-auto">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </details>
                )}

                {log.new_values && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">New Values</summary>
                    <pre className="mt-2 p-2 bg-secondary/30 rounded text-xs overflow-auto">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuditLogs;
