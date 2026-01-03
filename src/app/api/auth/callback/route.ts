import { NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "User-Agent": "eszfk-ami-test-manager"
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code
            })
        }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        return NextResponse.json(
            { error: "No access_token", tokenData },
            { status: 400 }
        );
    }

    const userRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "eszfk-ami-test-manager",
            Accept: "application/vnd.github+json"
        }
    });

    const user = await userRes.json();

    return NextResponse.json({
        ok: true,
        user: {
            id: user.id,
            login: user.login,
            avatar: user.avatar_url
        }
    });

}